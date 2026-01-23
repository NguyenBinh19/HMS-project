package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.roomtype.CreateRoomTypeRequest;
import com.HTPj.htpj.dto.response.roomtype.RoomTypeResponse;

public interface RoomTypeService {

    RoomTypeResponse createRoomType(CreateRoomTypeRequest request);
}
