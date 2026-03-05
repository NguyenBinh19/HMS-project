package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.kyc.KycUploadRequest;
import com.HTPj.htpj.dto.response.kyc.KycUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface KycService {
    KycUploadResponse uploadKyc(String userId,KycUploadRequest request, MultipartFile[] files);
}
