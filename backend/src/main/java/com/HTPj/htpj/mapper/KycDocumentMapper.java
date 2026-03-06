package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.response.kyc.KycDocumentResponse;
import com.HTPj.htpj.entity.KycDocument;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface KycDocumentMapper {

    KycDocumentResponse toResponse(KycDocument entity);

}
