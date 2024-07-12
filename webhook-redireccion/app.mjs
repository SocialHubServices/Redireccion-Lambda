/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */

import AWS from 'aws-sdk';
import { conectarSqlServer, desconectarSqlServer } from "./database/database.mjs";
import { guardarLogError, leerArchivo } from './controllers/archivos.mjs';
import obtenerFechaActual from './controllers/utilidades.mjs';

const nombreBucket = 'resultado-menus';

export const lambdaHandler = async (event, context) => {
    try {
        if (event.httpMethod === 'GET') {
            return {
                'statusCode': 200,
                'body': JSON.stringify({ msg: 200 })
            }
        } else if (event.httpMethod === 'POST') {
            const mensajeData = JSON.parse(event.body);
            const dataWebhook = await leerArchivo(nombreBucket, 'SocialHub/ArchivoWebHook', 'WebHooksEmpresas.xlsx');

            const numeroWebHook = {};
            dataWebhook.forEach(row => {
                numeroWebHook[row.NumeroTelefono] = row.WebHook;
            });

            if (numeroWebHook.hasOwnProperty(mensajeData.entry[0].changes[0].value.metadata.display_phone_number)) {
                const webHook = numeroWebHook[mensajeData.entry[0].changes[0].value.metadata.display_phone_number];
                const lambda = new AWS.Lambda();

                await lambda.invoke({
                    FunctionName: webHook,
                    InvocationType: 'Event',
                    Payload: JSON.stringify(event)
                }).promise();
            } else {
                // No se econtro el registro de la empresa
                //console.log('No se encontro el registro del numero buscado');
                await guardarLogError(nombreBucket, 'SocialHub', 'error_funcion_principal.txt', `No se encontro el registro de la empresa \n\n${JSON.stringify(mensajeData)}`, obtenerFechaActual('SA Pacific Standard Time'));
            }

            // const cnx = await conectarSqlServer();
            // const functionSql = await cnx.request().query(`SELECT * FROM WebhooksEmpresas WHERE NumeroTelefono = '${mensajeData.entry[0].changes[0].value.metadata.display_phone_number}'`);
            // await desconectarSqlServer(cnx);

            // if (functionSql.recordset && functionSql.recordset.length > 0) {
            //     const lambda = new AWS.Lambda();

            //     await lambda.invoke({
            //         FunctionName: functionSql.recordset[0].WebHook,
            //         InvocationType: 'Event',
            //         Payload: JSON.stringify(event)
            //     }).promise();
            // } else {
            //     //console.log("No se encontró el registro de la empresa")
            //     await guardarLogError(nombreBucket, 'SocialHub', 'error_funcion_principal.txt', `No se encontro el registro de la empresa \n\n${JSON.stringify(mensajeData)}`, obtenerFechaActual('SA Pacific Standard Time'));
            // }

            // Devueleve el statusCode 200 enseguida
            return {
                'statusCode': 200,
                'body': JSON.stringify({
                    message: 'Ok',
                })
            }
        }
    } catch (err) {
        console.log(err);
        let errSave;
        if (err.stack) {
            errSave = err.stack;
        } else if (typeof err === 'object') {
            try {
                errSave = JSON.stringify(err);
            } catch (jsonErr) {
                errSave = `No se pudo convertir a un JSON: ${jsonErr.message}\n\n${err}`;
            }
        } else {
            errSave = err.toString();
        }
        await guardarLogError(nombreBucket, 'SocialHub', 'error_funcion_principal.txt', `${errSave}\n\n${JSON.stringify(JSON.parse(event.body))}`, obtenerFechaActual('SA Pacific Standard Time'));

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Error interno del servidor',
                error: err.message
            })
        };
    }
};
