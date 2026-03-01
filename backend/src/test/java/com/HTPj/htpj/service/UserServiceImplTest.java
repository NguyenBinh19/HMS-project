package com.HTPj.htpj.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;

import com.HTPj.htpj.dto.request.UserCreationRequest;
import com.HTPj.htpj.dto.response.UserResponse;
import com.HTPj.htpj.entity.Users;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.repository.UserRepository;
import com.HTPj.htpj.service.impl.UserServiceImpl;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
@ActiveProfiles("test")
public class UserServiceImplTest {
    @Autowired
    private UserServiceImpl userServiceImpl;

    @MockitoBean
    private UserRepository userRepository;

    private UserCreationRequest request;
    private UserResponse userResponse;
    private Users user;
    private LocalDate dob;

    @BeforeEach
    void initData() {
        dob = LocalDate.of(1990, 1, 1);

        request = UserCreationRequest.builder()
                .username("john")
                .firstName("John")
                .lastName("Doe")
                .password("12345678")
                .dob(dob)
                .build();

        userResponse = UserResponse.builder()
                .id("cf0600f538b3")
                .username("john")
                .firstName("John")
                .lastName("Doe")
                .dob(dob)
                .build();

        user = Users.builder()
                .id("cf0600f538b3")
                .username("john")
                .firstName("John")
                .lastName("Doe")
                .dob(dob)
                .build();
    }

    @Test
    void createUser_validRequest_success() {
        // GIVEN
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.save(any())).thenReturn(user);

        // WHEN
        var response = userServiceImpl.createUser(request);
        // THEN

        Assertions.assertThat(response.getId()).isEqualTo("cf0600f538b3");
        Assertions.assertThat(response.getUsername()).isEqualTo("john");
    }

    @Test
    void createUser_userExisted_fail() {
        // GIVEN
        when(userRepository.existsByUsername(anyString())).thenReturn(true);

        // WHEN
        var exception = assertThrows(AppException.class, () -> userServiceImpl.createUser(request));

        // THEN
        Assertions.assertThat(exception.getErrorCode().getCode()).isEqualTo(1002);
    }

    @Test
    @WithMockUser(username = "john")
    void getMyInfo_valid_success() {
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(user));

        var response = userServiceImpl.getMyInfo();

        Assertions.assertThat(response.getUsername()).isEqualTo("john");
        Assertions.assertThat(response.getId()).isEqualTo("cf0600f538b3");
    }

    @Test
    @WithMockUser(username = "john")
    void getMyInfo_userNotFound_error() {
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.ofNullable(null));

        // WHEN
        var exception = assertThrows(AppException.class, () -> userServiceImpl.getMyInfo());

        Assertions.assertThat(exception.getErrorCode().getCode()).isEqualTo(1005);
    }
}