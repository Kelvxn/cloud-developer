import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic

export class AttachmentUtils {
    constructor(
            private readonly s3Client = new XAWS.S3({ signatureVersion: 'v4' }),
            private readonly s3BucketName = process.env.S3_BUCKET_NAME
        ) {
    }

    async generateUploadUrl(todoId: string): Promise<string> {

        const url = this.s3Client.getSignedUrl('putObject', {
            Bucket: this.s3BucketName,
            Key: todoId,
            Expires: 1500,
        });

        return url;
    }

}
