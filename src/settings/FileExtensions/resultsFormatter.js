import React from 'react';
import { FormattedDate } from 'react-intl';
import { upperFirst } from 'lodash';

import {
  Icon,
  AppIcon,
} from '@folio/stripes/components';

import css from './FileExtensions.css';

const resultsFormatter = intl => ({
  importBlocked: record => {
    const { importBlocked } = record;
    const translationIdEnding = `fileExtension${importBlocked ? 'Block' : 'Allow'}Import`;
    const fullTranslationId = `ui-data-import.settings.${translationIdEnding}`;

    return intl.formatMessage({ id: fullTranslationId });
  },
  dataTypes: record => {
    const { dataTypes } = record;

    // TODO: remove mapping when backend is adjusted to return type in needed format (MODSOURMAN-60)
    const formattedDataTypes = dataTypes.map(type => {
      return type !== 'DELIMITED' ? type : upperFirst(type.toLowerCase());
    });

    return formattedDataTypes.length > 0 ? formattedDataTypes.join(', ') : '-';
  },
  updated: record => {
    const { metadata: { updatedDate } } = record;

    return (
      <Icon
        iconClassName={css.editIcon}
        icon="edit"
        size="small"
      >
        <FormattedDate value={updatedDate} />
      </Icon>
    );
  },
  updatedBy: record => {
    const { metadata: { updatedByUsername } } = record;

    if (updatedByUsername === 'System') {
      return (
        <AppIcon
          size="small"
          app="data-import"
          iconKey="user"
        >
          {updatedByUsername.toUpperCase()}
        </AppIcon>
      );
    }

    return '';
  },
});

export default resultsFormatter;