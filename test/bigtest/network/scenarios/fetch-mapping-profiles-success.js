import { searchEntityByQuery } from '../../helpers/searchEntityByQuery';
import { noAssociatedActionProfiles } from '../../mocks';

export default server => {
  server.create('mapping-profile', {
    incomingRecordType: 'MARC_BIBLIOGRAPHIC',
    existingRecordType: 'INSTANCE',
    parentProfiles: noAssociatedActionProfiles,
  });
  server.create('mapping-profile', {
    incomingRecordType: 'MARC_HOLDINGS',
    existingRecordType: 'HOLDINGS',
  });
  server.create('mapping-profile', {
    incomingRecordType: 'MARC_BIBLIOGRAPHIC',
    existingRecordType: 'ITEM',
  });
  server.createList('mapping-profile', 2);

  server.get('/data-import-profiles/mappingProfiles', (schema, request) => {
    const { query = '' } = request.queryParams;
    const mappingProfiles = schema.mappingProfiles.all();

    const searchPattern = /name="([\w\s]+)/;

    return searchEntityByQuery({
      query,
      entity: mappingProfiles,
      searchPattern,
      fieldsToMatch: [
        'name',
        'mapped',
        'tags.tagList',
      ],
    });
  });
  server.get('/data-import-profiles/mappingProfiles/:id');
  server.delete('/data-import-profiles/mappingProfiles/:id', {}, 409);
  server.post('/data-import-profiles/mappingProfiles', (_, request) => {
    const params = JSON.parse(request.requestBody);
    const record = server.create('mapping-profile', params.profile);

    return record.attrs;
  });
  server.put('/data-import-profiles/mappingProfiles/:id', (schema, request) => {
    const {
      params: { id },
      requestBody,
    } = request;
    const mappingProfileModel = schema.mappingProfiles.find(id);
    const updatedMappingProfile = JSON.parse(requestBody);

    mappingProfileModel.update({ ...updatedMappingProfile.profile });

    return mappingProfileModel.attrs;
  });
};
