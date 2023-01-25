const fs = require('fs');
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import WAWebJS from "whatsapp-web.js";

export class S3Store implements WAWebJS.Store {
    private client: S3Client;
    private bucketName: string;

    constructor({ s3client = null, bucketName = "whatsapp-web-sessions" } = {}) {
        if(!s3client) throw new Error('A valid S3 Client instance is required for S3Store.');
        this.client = s3client;
        if(!bucketName) throw new Error('bucket name is required for S3Store.');
        this.bucketName = bucketName;
    }

    async sessionExists(options: { session: any; }) {
        // console.log("sessionExists", options);
        try {
            let getObjectResult = await this.client.send(new GetObjectCommand({
                Bucket: this.bucketName,
                Key: `whatsapp-js-${options.session}.zip`
            }));
            let hasExistingSession = getObjectResult.$metadata.httpStatusCode == 200;
            return !!hasExistingSession;
        } catch (err) {
            console.log("Error", err);
            return false;
        }
    }
    
    async save(options: { session: any; }) {
        // console.log("save", options);
        try {
            const fileStream = fs.createReadStream(`${options.session}.zip`);
            await this.client.send(new PutObjectCommand({
                Bucket: this.bucketName,
                Key: `whatsapp-js-${options.session}.zip`,
                Body: fileStream
            }));   
        } catch (err) {
            console.log("Error", err);
        }
    }

    async extract(options: { session: any; }) {
        // console.log("extract", options)
        try {
            let getObjectResult = await this.client.send(new GetObjectCommand({
                Bucket: this.bucketName,
                Key: `whatsapp-js-${options.session}.zip`
            }));

            if (getObjectResult.$metadata.httpStatusCode == 200) {
                let stream = getObjectResult.Body as Readable
                return new Promise<void>((resolve, reject) => {
                    stream.pipe(fs.createWriteStream(`${options.session}.zip`))
                        .on('error', (err: any) => reject(err))
                        .on('close', () => resolve());
                });
            }
        } catch (err) {
            console.log("Error", err);
        }
    }

    async delete(options: { session: any; }) {
        // console.log("delete", options)
        try {
            await this.client.send(new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: `whatsapp-js-${options.session}.zip`,
            }));
        } catch (err) {
            console.log("Error", err);
        }
        
    }
}