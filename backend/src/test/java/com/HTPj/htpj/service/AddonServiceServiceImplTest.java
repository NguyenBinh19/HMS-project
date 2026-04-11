//package com.HTPj.htpj.service;
//
//import com.HTPj.htpj.dto.request.addonservice.CreateAddonServiceRequest;
//import com.HTPj.htpj.dto.response.addonservice.AddonServiceResponse;
//import com.HTPj.htpj.entity.AddonService;
//import com.HTPj.htpj.entity.Hotel;
//import com.HTPj.htpj.exception.AppException;
//import com.HTPj.htpj.repository.AddonServiceRepository;
//import com.HTPj.htpj.repository.BookingAddonServiceRepository;
//import com.HTPj.htpj.repository.BookingRepository;
//import com.HTPj.htpj.repository.HotelRepository;
//import com.HTPj.htpj.service.impl.AddonServiceServiceImpl;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.ArgumentCaptor;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//
//import java.math.BigDecimal;
//import java.util.Optional;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.assertj.core.api.Assertions.assertThatThrownBy;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class AddonServiceServiceImplTest {
//
//    @Mock
//    private AddonServiceRepository addonServiceRepository;
//
//    @Mock
//    private BookingAddonServiceRepository bookingAddonServiceRepository;
//
//    @Mock
//    private HotelRepository hotelRepository;
//
//    @Mock
//    private BookingRepository bookingRepository;
//
//    @InjectMocks
//    private AddonServiceServiceImpl addonServiceService;
//
//    @Test
//    void createService_N_Success() {
//        // GIVEN
//        CreateAddonServiceRequest request = new CreateAddonServiceRequest();
//        request.setHotelId(1);
//        request.setServiceName("Airport Pickup");
//        request.setCategory("transport");
//        request.setDescription("Private car transfer");
//        request.setNetPrice(new BigDecimal("20.00"));
//        request.setPublicPrice(new BigDecimal("30.00"));
//        request.setUnit("trip");
//        request.setImageUrl("https://img.test/pickup.png");
//        request.setRequireServiceDate(true);
//        request.setRequireFlightInfo(true);
//        request.setRequireSpecialNote(false);
//
//        Hotel hotel = new Hotel();
//        when(hotelRepository.findById(1)).thenReturn(Optional.of(hotel));
//        when(addonServiceRepository.save(any(AddonService.class)))
//                .thenAnswer(invocation -> invocation.getArgument(0));
//
//        // WHEN
//        AddonServiceResponse response = addonServiceService.createService(request);
//
//        // THEN
//        ArgumentCaptor<AddonService> captor = ArgumentCaptor.forClass(AddonService.class);
//        verify(addonServiceRepository).save(captor.capture());
//        AddonService saved = captor.getValue();
//
//        assertThat(saved.getHotel()).isSameAs(hotel);
//        assertThat(saved.getServiceName()).isEqualTo("Airport Pickup");
//        assertThat(saved.getStatus()).isEqualTo("active");
//        assertThat(saved.getRequireServiceDate()).isTrue();
//        assertThat(saved.getRequireFlightInfo()).isTrue();
//        assertThat(saved.getRequireSpecialNote()).isFalse();
//        assertThat(response).isNotNull();
//    }
//
//    @Test
//    void createService_A_HotelNotFound() {
//        // GIVEN
//        CreateAddonServiceRequest request = new CreateAddonServiceRequest();
//        request.setHotelId(999);
//
//        when(hotelRepository.findById(999)).thenReturn(Optional.empty());
//
//        // WHEN
//        // THEN
//        assertThatThrownBy(() -> addonServiceService.createService(request))
//                .isInstanceOf(AppException.class);
//
//        verify(addonServiceRepository, never()).save(any(AddonService.class));
//    }
//
//    @Test
//    void createService_B_NullBooleans() {
//        // GIVEN
//        CreateAddonServiceRequest request = new CreateAddonServiceRequest();
//        request.setHotelId(1);
//        request.setServiceName("Late Checkout");
//        request.setCategory("room");
//        request.setDescription("Extend checkout time");
//        request.setNetPrice(new BigDecimal("10.00"));
//        request.setPublicPrice(new BigDecimal("15.00"));
//        request.setUnit("hour");
//        request.setImageUrl("https://img.test/late-checkout.png");
//        request.setRequireServiceDate(null);
//        request.setRequireFlightInfo(null);
//        request.setRequireSpecialNote(null);
//
//        Hotel hotel = new Hotel();
//        when(hotelRepository.findById(1)).thenReturn(Optional.of(hotel));
//        when(addonServiceRepository.save(any(AddonService.class)))
//                .thenAnswer(invocation -> invocation.getArgument(0));
//
//        // WHEN
//        addonServiceService.createService(request);
//
//        // THEN
//        ArgumentCaptor<AddonService> captor = ArgumentCaptor.forClass(AddonService.class);
//        verify(addonServiceRepository).save(captor.capture());
//        AddonService saved = captor.getValue();
//
//        assertThat(saved.getRequireServiceDate()).isFalse();
//        assertThat(saved.getRequireFlightInfo()).isFalse();
//        assertThat(saved.getRequireSpecialNote()).isFalse();
//    }
//}
