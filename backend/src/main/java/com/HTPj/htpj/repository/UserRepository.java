package com.HTPj.htpj.repository;

import java.util.Optional;

import com.HTPj.htpj.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface UserRepository extends JpaRepository<Users, String> {
    boolean existsByUsername(String username);

    Optional<Users> findByUsername(String username);
}