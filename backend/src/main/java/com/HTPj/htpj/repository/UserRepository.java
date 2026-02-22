package com.HTPj.htpj.repository;

import java.util.Optional;

import com.HTPj.htpj.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface UserRepository extends JpaRepository<Users, String> {
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    Optional<Users> findByEmail(String email);
    Optional<Users> findByUsername(String username);
}