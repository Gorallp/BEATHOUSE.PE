package com.beathouse.com.beathouse.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.beathouse.com.beathouse.entity.InstrumentEntity;

@Repository
public interface InstrumentRepository extends JpaRepository<InstrumentEntity, Long> {

}
