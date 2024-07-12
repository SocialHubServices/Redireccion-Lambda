import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadBucketCommand, CreateBucketCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import XLSX from 'xlsx';
import AWS from 'aws-sdk';

const s3 = new S3Client({
    region: 'us-east-1',
});

async function verificarBucket(bucketName) {
    const input = {
        "Bucket": bucketName,
    }

    const verBucketEsxistente = new HeadBucketCommand(input);
    return await s3.send(verBucketEsxistente)
        .then(() => {
            //console.log('El bucket existe')
            return true;
        })
        .catch(async (error) => {
            //console.log('El bucket no existe')
            return false;
        })
}

async function crearBucket(bucketName) {
    if (await verificarBucket(bucketName)) {
        return true;
    } else {
        const inputCreate = {
            "Bucket": bucketName,
        }

        const createBucketCommand = new CreateBucketCommand(inputCreate);

        return await s3.send(createBucketCommand)
            .then(() => {
                //console.log('El bucket se creo con exito')
                return true;
            })
            .catch((err) => {

                //console.log('Error al crear el bucket')
                return false;
            })
    }
}

async function guardarLogError(bucketName, folderName, fileName, errorMensaje, fechaActual) {
    if (await crearBucket(bucketName)) {
        const params = {
            "Bucket": bucketName,
            "Key": `${folderName}/${fileName}`
        }

        const caracteresDivisores = `================================================================`

        const commandHeadObject = new HeadObjectCommand(params);
        await s3.send(commandHeadObject)
            .then(async () => {
                //console.log('Archivo para sobreescribir')
                const commandGetContenido = new GetObjectCommand(params);

                const res = await s3.send(commandGetContenido)
                const ctnDv = await res.Body.transformToString();
                const obJ = `${ctnDv}\n\n${caracteresDivisores}${fechaActual}${caracteresDivisores}\n${errorMensaje}`
                //console.log(obJ)

                const fileParams = {
                    Bucket: bucketName,
                    Key: folderName + "/" + fileName,
                    Body: obJ,
                }

                const putObjectCommandN = new PutObjectCommand(fileParams);

                await s3.send(putObjectCommandN);
            })
            .catch(async (err) => {
                //console.log('Archivo para crear')
                const fileParamsNew = {
                    Bucket: bucketName,
                    Key: folderName + "/" + fileName,
                    Body: `${caracteresDivisores}${fechaActual}${caracteresDivisores}\n${errorMensaje}`
                }

                const putObjectCommandNew = new PutObjectCommand(fileParamsNew);

                await s3.send(putObjectCommandNew);
            })
    }
}
  
async function leerArchivo(bucketName, folderName, fileName) {
    try{
        const params = {
            "Bucket": bucketName,
            "Key": `${folderName}/${fileName}`
        }
    
        const clientS3 = new AWS.S3({
            region: 'us-east-1',
        });
    
        // Leer el archivo Excel
        const res = await clientS3.getObject(params).promise();
        const libroTrabajo = XLSX.read(res.Body);
        const data = XLSX.utils.sheet_to_json(libroTrabajo.Sheets[libroTrabajo.SheetNames[0]]);
        
        return data;
    }
    catch(err){
        throw new Error(`Error al leer el archivo ${err}`);
    }
}

export {
    guardarLogError,
    leerArchivo
};