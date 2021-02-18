'use strict';

const { basename, join } = require('path');
const { copy } = require('fs-extra');
const { renameService } = require('./renameService');
const fs = require('fs');

const serverlessPath = join(__dirname, '../../');

const resolveServiceName = (path) => {
  let serviceName = basename(path)
    .toLowerCase()
    .replace(/[^0-9a-z.]+/g, '-');
  if (!serviceName.match(/^[a-z]/)) serviceName = `service-${serviceName}`;
  return serviceName;
};

module.exports = async (templateName, destPath, options = {}) => {
  if (!options) options = {};
  const templateSrcDir = join(serverlessPath, 'lib/plugins/create/templates', templateName);

  if (!options.name) {
    try {
      const content = await fs.promises.readFile(join(destPath, 'package.json'), 'utf8');
      try {
        options.name = JSON.parse(content).name;
      } catch {
        // Pass
      }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
  }

  await copy(templateSrcDir, destPath);
  try {
    await fs.promises.rename(
      join(destPath, 'gradle/wrapper/gradle-wrapper'),
      join(destPath, 'gradle/wrapper/gradle-wrapper.jar')
    );
  } catch {
    // Pass
  }
  return renameService(options.name || resolveServiceName(destPath), destPath);
};
