const createWorker = require('./../worker');
const githubFixture = require('../fixtures/github.response.json');

githubFixture.meta = {};
githubFixture.meta.etag = 'EXAMPLE_ETAG';

const fn = (results) => jest.fn(() => new Promise(resolve => resolve(results)));
const findFn = jest.fn(() => ({toArray: fn([])}));
const insertFn = fn({});
const updateFn = fn({});
const sendFn = fn({});
const mailerMock = {sendEmail: sendFn};
const githubMock = {issues: {getForRepo: jest.fn(() => new Promise(resolve => resolve(githubFixture)))}};
const databaseMock = {collection: jest.fn(() => ({find: findFn, update: updateFn, insert: insertFn}))};

test('EditItem', () => {
  const worker = createWorker(githubMock, databaseMock, mailerMock);

  worker.editItem({
    email: 'konmpar@gmail.com',
    repo: 'kbariotis/throw.js',
    label: 'Need help',
    _id: '5890a62b8acbfb45a3f57189'
  });

  expect(githubMock.issues.getForRepo.mock.calls[0][0]).toMatchSnapshot();
});

test('ProcessGithubResponse', () => {
  const worker = createWorker(githubMock, databaseMock, mailerMock);

  githubFixture.meta.status = '304 Not Modified';

  return worker.processGithubResponse({
    email: 'konmpar@gmail.com',
    repo: 'kbariotis/throw.js',
    label: 'Need help',
    _id: '5890a62b8acbfb45a3f57189'
  }, githubFixture)
  .then(() => expect(updateFn.mock.calls[0][0]).toMatchSnapshot());
});

test('ProcessGithubResponse', () => {
  const worker = createWorker(githubMock, databaseMock, mailerMock);

  githubFixture.meta.status = '200 OK';

  return worker.processGithubResponse({
    email: 'konmpar@gmail.com',
    repo: 'kbariotis/throw.js',
    label: 'Need help',
    _id: '5890a62b8acbfb45a3f57189'
  }, githubFixture)
  .then(() => expect(findFn.mock.calls[0][0]).toMatchSnapshot());
});

test('ProcessGithubResponse', () => {
  const worker = createWorker(githubMock, databaseMock, mailerMock);

  githubFixture.meta.status = '200 OK';

  return worker.processGithubResponse({
    email: 'konmpar@gmail.com',
    repo: 'kbariotis/throw.js',
    label: 'Need help',
    _id: '5890a62b8acbfb45a3f57189'
  }, githubFixture)
  .then(() => expect(insertFn.mock.calls[0][0]).toMatchSnapshot());
});

test('FilterIssues', () => {
  const worker = createWorker(githubMock, databaseMock, mailerMock);

  const results = worker.filterIssues(githubFixture, [{issue_number: 1347}]);

  expect(results.length).toBe(0);
});

test('FilterIssues', () => {
  const worker = createWorker(githubMock, databaseMock, mailerMock);

  const results = worker.filterIssues(githubFixture, [{issue_number: 1234}]);

  expect(results.length).toBe(1);
});

test('SendEmails', () => {
  const worker = createWorker(githubMock, databaseMock, mailerMock);

  return worker.sendEmails({_id: '5890a62b8acbfb45a3f57189'}, githubFixture)
    .then(() => expect(sendFn).toBeCalled());
});

test('SendEmails', () => {
  const worker = createWorker(githubMock, databaseMock, mailerMock);

  return worker.sendEmails({_id: '5890a62b8acbfb45a3f57189'}, githubFixture)
    .then(() => expect(insertFn).toBeCalled());
});

test('SendEmails', () => {
  const worker = createWorker(githubMock, databaseMock, mailerMock);

  worker.sendEmails({_id: '5890a62b8acbfb45a3f57189'}, []);

  sendFn.mockClear();
  expect(sendFn.mock.calls.length).toBe(0);
});
