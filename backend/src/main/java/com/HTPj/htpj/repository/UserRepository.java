package com.HTPj.htpj.repository;

import java.util.Optional;

import com.HTPj.htpj.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


@Repository
public interface UserRepository extends JpaRepository<Users, String> {
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    Optional<Users> findByEmail(String email);
    Optional<Users> findByUsername(String username);

    @Modifying
    @Query("UPDATE Users u SET u.status='INACTIVE' WHERE u.agency.agencyId = :agencyId")
    void suspendUsersByAgency(Long agencyId);

    @Modifying
    @Query("UPDATE Users u SET u.status='INACTIVE' WHERE u.hotel.hotelId = :hotelId")
    void suspendUsersByHotel(Integer hotelId);
}