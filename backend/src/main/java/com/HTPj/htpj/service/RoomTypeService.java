package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.CreateRoomTypeRequest;
import com.HTPj.htpj.dto.response.RoomTypeResponse;

public interface RoomTypeService {

    RoomTypeResponse createRoomType(CreateRoomTypeRequest request);
}
