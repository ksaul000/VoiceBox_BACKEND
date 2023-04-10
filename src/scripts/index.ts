console.log("asdfasdf");
import { loadAppConfig } from '../utils/utils';
const config = loadAppConfig('config.json');
import { init, getRequest } from '../mssql/index'
import * as fs from 'fs';
import { argv } from 'process';

async function runScripts() {
    config.database_config.database = 'master';
    await init(config.database_config);
    const request = getRequest();
  
    const fileNamesForDatabases = fs.readdirSync(
        "src/scripts/scripts_for_database"
    );
    const fileNamesForDatabasesSorted = fileNamesForDatabases.sort();
    let fileNameDatabase: any;
    for (fileNameDatabase of fileNamesForDatabasesSorted) {
      console.log(`Running ${fileNameDatabase}`);
      const query = fs
      .readFileSync(
        "src/scripts/scripts_for_database/" + fileNameDatabase
        )
        .toString();
      await request.query(query);
    }
  
    config.database_config.database = argv[2];
    await init(config.database_config);
    const requestForTables = getRequest();
  
    const fileNames = fs.readdirSync("src/scripts");
    const fileNamesSorted = fileNames.sort();
    let fileName: any;
    for (fileName of fileNamesSorted)
    if (fileName.includes('.sql')) {
      console.log(`Running ${fileName}`);
      const query = fs.readFileSync("src/scripts" + '/' + fileName).toString();
        await requestForTables.query(query);
      }
  }
  runScripts().then(_ => process.exit(0));
  