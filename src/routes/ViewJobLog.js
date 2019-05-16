import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { stripesConnect } from '@folio/stripes/core';

import { Preloader } from '../components/Preloader';

@stripesConnect
export class ViewJobLog extends Component {
  static manifest = Object.freeze({
    jobLog: {
      type: 'okapi',
      path: 'source-storage/sourceRecords?query=snapshotId=:{id}&limit=1000',
      throwsErrors: false,
    },
  });

  static propTypes = {
    resources: PropTypes.shape({
      jobLog: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        records: PropTypes.arrayOf(
          PropTypes.object.isRequired
        ).isRequired,
      }),
    }),
  };

  componentDidMount() {
    document.querySelector('header').setAttribute('style', 'display: none');
  }

  get jobLogData() {
    const { resources } = this.props;

    const jobLog = resources.jobLog || {};
    const [record] = jobLog.records || [];

    return {
      hasLoaded: jobLog.hasLoaded,
      record,
    };
  }

  formatSourceRecords = sourceRecords => JSON.stringify(sourceRecords, null, 2);

  render() {
    const {
      hasLoaded,
      record,
    } = this.jobLogData;
    const renderSpinner = !record || !hasLoaded;

    if (renderSpinner) {
      return (
        <Preloader />
      );
    }

    const {
      sourceRecords,
      totalRecords,
    } = record;

    return (
      <div id="view-job-log-test">
        <div id="view-total-records-test">
          <FormattedMessage
            id="ui-data-import.recordsCount"
            values={{ count: totalRecords }}
          />
        </div>
        <pre id="job-log-json">
          {this.formatSourceRecords(sourceRecords)}
        </pre>
      </div>
    );
  }
}