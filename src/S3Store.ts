const fs = require('fs');
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import WAWebJS from "whatsapp-web.js";

export class S3Store implements WAWebJS.Store {
    private client: S3Client;
    private bucketName: string;
    private filepath: string;

    constructor(
        options: {
            s3Client: S3Client,
            bucketName: string,
            filepath?: string,
        } = {
            s3Client: new S3Client({}),
            bucketName: "whatsapp-web-sessions",
            filepath: "",
        }
    ) {
        if(!options.s3Client) throw new Error('A valid S3 Client instance is required for S3Store.');
        this.client = options.s3Client;

        if(!options.bucketName) throw new Error('bucket name is required for S3Store.');
        this.bucketName = options.bucketName;

        if(!options.filepath) {
            this.filepath = "";
        } else {
            this.filepath = options.filepath;
        }
    }

    async sessionExists(options: { session: string }) {
        // console.log("sessionExists", options);
        try {
            let getObjectResult = await this.client.send(new GetObjectCommand({
                Bucket: this.bucketName,
                Key: `${this.filepath}whatsapp-js-${options.session}.zip`
            }));
            let hasExistingSession = getObjectResult.$metadata.httpStatusCode == 200;
            return !!hasExistingSession;
        } catch (err) {
            console.error("Error", err);
            return false;
        }
    }
    
    async save(options: { session: string }) {
        try {
            const fileStream = fs.createReadStream(`${options.session}.zip`);
            await this.client.send(new PutObjectCommand({
                Bucket: this.bucketName,
                Key: `${this.filepath}whatsapp-js-${options.session}.zip`,
                Body: fileStream
            }));
        } catch (err) {
            console.error("Error", err);
        }
    }

    async extract(options: { session: string, path: string }) {
        try {
            let getObjectResult = await this.client.send(new GetObjectCommand({
                Bucket: this.bucketName,
                Key: `${this.filepath}whatsapp-js-${options.session}.zip`
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
            console.error("Error", err);
        }
    }

    async delete(options: { session: string }) {
        try {
            await this.client.send(new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: `${this.filepath}whatsapp-js-${options.session}.zip`,
            }));
        } catch (err) {
            console.error("Error", err);
        }
    }
}