import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';

import {
  makeQueryFunction,
  SearchAndSort,
} from '@folio/stripes/smart-components';
import {
  changeSearchIndex,
  getActiveFilters,
  handleFilterChange,
} from '@folio/stripes-acq-components';

import { stripesConnect } from '@folio/stripes/core';
import { Button } from '@folio/stripes/components';
import {
  get,
  noop,
} from 'lodash';
import packageInfo from '../../../package';
import { FILE_STATUSES } from '../../utils/constants';
import { filterConfig } from './ViewAllLogsFilterConfig';
import ViewAllLogsFilters from './ViewAllLogsFilters';
import {
  logsSearchTemplate,
  searchableIndexes,
} from './ViewAllLogsSearchConfig';
import sharedCss from '../../shared.css';
import { listTemplate } from '../../components/ListTemplate';

const {
  COMMITTED,
  ERROR,
} = FILE_STATUSES;

const columnMapping = {
  fileName: <FormattedMessage id="ui-data-import.fileName" />,
  hrId: <FormattedMessage id="ui-data-import.jobExecutionHrId" />,
  jobProfileName: <FormattedMessage id="ui-data-import.jobProfileName" />,
  totalRecords: <FormattedMessage id="ui-data-import.records" />,
  completedDate: <FormattedMessage id="ui-data-import.jobCompletedDate" />,
  runBy: <FormattedMessage id="ui-data-import.runBy" />,
};

const visibleColumns = [
  'fileName',
  'hrId',
  'jobProfileName',
  'totalRecords',
  'completedDate',
  'runBy',
];

const INITIAL_RESULT_COUNT = 25;
const RESULT_COUNT_INCREMENT = 25;

@stripesConnect
class ViewAllLogs extends Component {
  static propTypes = {
    mutator: PropTypes.object.isRequired,
    resources: PropTypes.object.isRequired,
    stripes: PropTypes.object,
    disableRecordCreation: PropTypes.bool,
    browseOnly: PropTypes.bool,
    packageInfo: PropTypes.object,
    history: PropTypes.shape({ push: PropTypes.func.isRequired }),
    intl: PropTypes.object.isRequired,
  };

  static defaultProps = { browseOnly: false };

  static manifest = Object.freeze({
    initializedFilterConfig: { initialValue: false },
    query: {
      initialValue: {
        query: '',
        filters: '',
        sort: '-completedDate',
      },
    },
    resultCount: { initialValue: INITIAL_RESULT_COUNT },
    records: {
      type: 'okapi',
      clear: true,
      records: 'jobExecutions',
      recordsRequired: '%{resultCount}',
      path: 'metadata-provider/jobExecutions',
      perRequest: RESULT_COUNT_INCREMENT,
      throwErrors: false,
      GET: {
        params: {
          query: makeQueryFunction(
            `(status any "${COMMITTED} ${ERROR}")`,
            logsSearchTemplate,
            {
              fileName: 'fileName',
              hrId: 'hrId/number',
              jobProfileName: 'jobProfileInfo.name',
              totalRecords: 'progress.total/number',
              completedDate: 'completedDate',
              runBy: 'runBy.firstName runBy.lastName',
            },
            filterConfig,
          ),
        },
        staticFallback: { params: {} },
      },
    },
  });

  constructor(props) {
    super(props);
    this.getActiveFilters = getActiveFilters.bind(this);
    this.handleFilterChange = handleFilterChange.bind(this);
    this.changeSearchIndex = changeSearchIndex.bind(this);
    this.onRowClick = this.onRowClick.bind(this);
  }

  onRowClick(e, meta) {
    const path = `/data-import/log/${meta.id}`;

    window.open(path, '_blank').focus();
  }

  getSearchableIndexes() {
    const { intl: { formatMessage } } = this.props;

    return searchableIndexes.map(index => {
      const label = formatMessage({ id: `ui-data-import.${index.label}` });
      const placeholder = formatMessage({ id: `ui-data-import.placeholder.${index.placeholder}` });

      return {
        ...index,
        label,
        placeholder,
      };
    });
  }

  renderFilters = onChange => {
    const { resources } = this.props;

    const jobProfiles = get(resources, ['records', 'records'], [])
      .map(item => item.jobProfileInfo);
    const users = get(resources, ['records', 'records'], [])
      .map(item => ({
        userId: item.userId,
        firstName: item.runBy.firstName,
        lastName: item.runBy.lastName,
      }));

    return resources.query
      ? (
        <ViewAllLogsFilters
          activeFilters={this.getActiveFilters()}
          onChange={onChange}
          queryMutator={this.props.mutator.query}
          jobProfiles={jobProfiles}
          users={users}
        />
      )
      : null;
  };

  render() {
    const {
      browseOnly,
      disableRecordCreation,
      mutator,
      resources,
      stripes,
      intl,
    } = this.props;

    const resultsFormatter = {
      fileName: record => (
        <Button
          buttonStyle="link"
          marginBottom0
          buttonClass={sharedCss.cellLink}
          target="_blank"
        >
          {record.fileName}
        </Button>
      ),
      runBy: listTemplate({ intl }).runBy,
      completedDate: listTemplate({ intl }).completedDate,
      jobProfileName: listTemplate({ intl }).jobProfileName,
      totalRecords: listTemplate({ intl }).totalRecords,
    };

    return (
      <div data-test-logs-list>
        <SearchAndSort
          packageInfo={this.props.packageInfo || packageInfo}
          objectName="job-logs"
          baseRoute={packageInfo.stripes.route}
          initialResultCount={INITIAL_RESULT_COUNT}
          resultCountIncrement={RESULT_COUNT_INCREMENT}
          visibleColumns={visibleColumns}
          columnMapping={columnMapping}
          resultsFormatter={resultsFormatter}
          viewRecordComponent={noop}
          onSelectRow={this.onRowClick}
          viewRecordPerms="metadata-provider.jobexecutions.get"
          parentResources={resources}
          parentMutator={mutator}
          stripes={stripes}
          disableRecordCreation={disableRecordCreation}
          browseOnly={browseOnly}
          showSingleResult={false}
          searchableIndexes={this.getSearchableIndexes()}
          selectedIndex={get(resources.query, 'qindex')}
          renderFilters={this.renderFilters}
          onFilterChange={this.handleFilterChange}
          onChangeIndex={this.changeSearchIndex}
          title={<FormattedMessage id="ui-data-import.logsPaneTitle" />}
        />
      </div>
    );
  }
}

export default injectIntl(ViewAllLogs);
