package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.AuthenticationRequest;
import com.HTPj.htpj.dto.request.IntrospectRequest;
import com.HTPj.htpj.dto.request.LogoutRequest;
import com.HTPj.htpj.dto.request.RefreshRequest;
import com.HTPj.htpj.dto.response.AuthenticationResponse;
import com.HTPj.htpj.dto.response.IntrospectResponse;
import com.nimbusds.jose.JOSEException;

import java.text.ParseException;

public interface AuthenticationService {

    IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException;

    AuthenticationResponse authenticate(AuthenticationRequest request);

    void logout(LogoutRequest request) throws ParseException, JOSEException;

    AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException;
}
