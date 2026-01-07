package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.request.UserCreationRequest;
import com.HTPj.htpj.dto.request.UserUpdateRequest;
import com.HTPj.htpj.dto.response.UserResponse;
import com.HTPj.htpj.entity.Users;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {
    Users toUser(UserCreationRequest request);

    UserResponse toUserResponse(Users user);

    @Mapping(target = "roles", ignore = true)
    void updateUser(@MappingTarget Users user, UserUpdateRequest request);
}