import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

async function conectarSqlServer(cadenaConexion = 'DB') {
    try {
        const trustServer = process.env.CERTIFICATEDB ? true : false;

        let configProd = {
            user: process.env.DB_PROD_USER,
            password: process.env.DB_PROD_PASSWORD,
            server: process.env.DB_PROD_SERVER,
            database: process.env.DB_PROD_DATABASE,
            options: {
                encrypt: true,
                trustServerCertificate: trustServer
            }
        };
        let conPrd = new sql.ConnectionPool(configProd);
        return conPrd.connect();
    } catch (error) {
        console.log('Error al conectar a la base de datos: ', error);
        throw error;
    }
}

async function desconectarSqlServer(cnx) {
    if (cnx.connected) {
        await cnx.close();
        // console.log('Desconexion exitosa');
    }
}

export {
    conectarSqlServer,
    desconectarSqlServer,
};