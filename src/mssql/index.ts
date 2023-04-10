import * as sql from 'mssql'
let connectionPool: any = null;


export function getConnectionPool() {
    return connectionPool;
  }
  
  export function getPreparedStatement() {
    return new sql.PreparedStatement(getConnectionPool());
  }
  
  export function getRequest(){
      return new sql.Request(getConnectionPool());
  }

  export async function init(config: any) {
    console.log('Trying to connect to database...');
    try {
      connectionPool = await new sql.ConnectionPool(config).connect();
      console.log('Connected to database');
    } catch (err) {
      console.error('Connection to database failed');
      console.error(err);
      throw err;
    }
  }