export default server => {
  server.delete('/data-import/uploadDefinitions/:id/files/:fileId', {}, 500);
};
