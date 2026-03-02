package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.vault.S3VaultProps;
import com.HTPj.htpj.service.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;

@Service
public class S3ServiceImpl implements S3Service {
    @Autowired
    private S3Client s3Client;

    private final S3VaultProps props;

    public S3ServiceImpl(S3VaultProps props) {
        this.props = props;
    }

    @Override
    public void uploadFile(MultipartFile file) throws IOException {
        s3Client.putObject(PutObjectRequest.builder()
                        .bucket(props.getBucketName())
                        .key(file.getOriginalFilename())
                        .build(),
                RequestBody.fromBytes(file.getBytes()));
    }

    @Override
    public byte[] downloadFile(String key) {
        ResponseBytes<GetObjectResponse> objectAsBytes =
                s3Client.getObjectAsBytes(GetObjectRequest.builder()
                        .bucket(props.getBucketName())
                        .key(key)
                        .build());
        return objectAsBytes.asByteArray();
    }
}
