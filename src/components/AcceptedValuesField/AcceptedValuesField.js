import React, {
  useEffect,
  useState,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import { isEmpty } from 'lodash';

import { withReferenceValues } from '../FlexibleForm/ControlDecorators/withReferenceValues';

import { fetchAcceptedValuesList } from './fetchAcceptedValuesList';
import {
  validateMARCWithElse,
  validateAcceptedValues,
} from '../../utils';

export const AcceptedValuesField = ({
  id,
  name,
  label,
  okapi,
  component,
  optionValue,
  optionLabel,
  wrapperLabel,
  acceptedValuesList,
  wrapperSourceLink,
  wrapperSourcePath,
  setAcceptedValues,
  dataAttributes,
}) => {
  const [listOptions, setListOptions] = useState(acceptedValuesList);

  const getAcceptedValuesObj = data => {
    let acceptedValues = {};

    data.forEach(item => {
      acceptedValues = {
        ...acceptedValues,
        [item.id]: item.name,
      };
    });

    return acceptedValues;
  };

  useEffect(() => {
    if (wrapperSourceLink && wrapperSourcePath && isEmpty(acceptedValuesList)) {
      fetchAcceptedValuesList(okapi, wrapperSourceLink, wrapperSourcePath)
        .then(data => {
          const acceptedValues = getAcceptedValuesObj(data);

          setListOptions(data);
          setAcceptedValues(acceptedValues);
        });
    }
  }, [okapi, wrapperSourceLink, wrapperSourcePath, acceptedValuesList]); // eslint-disable-line react-hooks/exhaustive-deps
  const memoizedValidation = useCallback(
    validateAcceptedValues(listOptions, optionValue),
    [listOptions],
  );

  return (
    <Field
      id={id}
      component={withReferenceValues}
      name={name}
      label={label}
      dataOptions={listOptions}
      optionValue={optionValue}
      optionLabel={optionLabel}
      WrappedComponent={component}
      wrapperLabel={wrapperLabel}
      validate={[validateMARCWithElse, memoizedValidation]}
      {...dataAttributes}
    />
  );
};

AcceptedValuesField.propTypes = {
  component: PropTypes.oneOfType([React.Component, PropTypes.func]).isRequired,
  name: PropTypes.string.isRequired,
  optionValue: PropTypes.string.isRequired,
  optionLabel: PropTypes.string.isRequired,
  okapi: PropTypes.shape({
    tenant: PropTypes.string.isRequired,
    token: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
  acceptedValuesList: PropTypes.arrayOf(PropTypes.object),
  wrapperSourceLink: PropTypes.string,
  wrapperSourcePath: PropTypes.string,
  wrapperLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]),
  id: PropTypes.string,
  setAcceptedValues: PropTypes.func,
  dataAttributes: PropTypes.arrayOf(PropTypes.object),
};

AcceptedValuesField.defaultProps = { acceptedValuesList: [] };
