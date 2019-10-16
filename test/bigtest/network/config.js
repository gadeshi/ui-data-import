// typical mirage config export
// http://www.ember-cli-mirage.com/docs/v0.4.x/configuration/
import { jobsLogs as jobExecutions } from '../mocks';

export default function config() {
  this.get('/metadata-provider/jobExecutions', {
    jobExecutions: [],
    totalRecords: 0,
  });

  this.get('/data-import/fileExtensions', {
    fileExtensions: [],
    totalRecords: 0,
  });

  this.get('/data-import/uploadDefinitions', {
    uploadDefinitions: [],
    totalRecords: 0,
  });
}
