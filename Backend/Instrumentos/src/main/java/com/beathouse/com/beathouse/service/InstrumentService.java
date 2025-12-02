package com.beathouse.com.beathouse.service;

import com.beathouse.com.beathouse.entity.InstrumentEntity;
import com.beathouse.com.beathouse.repository.InstrumentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class InstrumentService {

    private final InstrumentRepository repository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public InstrumentService(InstrumentRepository repository) {
        this.repository = repository;
    }

    public List<InstrumentEntity> findAll() {
        return repository.findByIsDeletedFalse();
    }

    public Page<InstrumentEntity> findAll(Pageable pageable) {
        return repository.findByIsDeletedFalse(pageable);
    }

    public InstrumentEntity findById(Long id) {
        return repository.findById(id)
                .filter(i -> i.getIsDeleted() == null || !i.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Instrument not found"));
    }

    public InstrumentEntity create(InstrumentEntity instrument) {
        instrument.setId(null);
        instrument.setIsDeleted(false);
        LocalDateTime now = LocalDateTime.now();
        instrument.setCreatedAt(now);
        instrument.setUpdatedAt(now);
        return repository.save(instrument);
    }

    public InstrumentEntity create(InstrumentEntity instrument, MultipartFile image) {
        if (image != null && !image.isEmpty()) {
            try {
                Path uploadPath = Path.of(uploadDir).toAbsolutePath().normalize();
                Files.createDirectories(uploadPath);
                String original = Path.of(image.getOriginalFilename()).getFileName().toString();
                String filename = System.currentTimeMillis() + "_" + original;
                Path target = uploadPath.resolve(filename);
                try (var in = image.getInputStream()) {
                    Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
                }
                // set URL to be served via /uploads/{filename}
                instrument.setImageUrl("/uploads/" + filename);
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store image", e);
            }
        }

        return create(instrument);
    }

    public InstrumentEntity createFromForm(String name, String description, BigDecimal price, String category, MultipartFile image) {
        InstrumentEntity instrument = InstrumentEntity.builder()
                .name(name)
                .description(description)
                .price(price)
                .category(category)
                .build();

        return create(instrument, image);
    }

    public InstrumentEntity update(Long id, InstrumentEntity updated) {
        InstrumentEntity existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Instrument not found"));

        if (existing.getIsDeleted() != null && existing.getIsDeleted()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Instrument not found");
        }

        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setPrice(updated.getPrice());
        existing.setCategory(updated.getCategory());
        existing.setImageUrl(updated.getImageUrl());
        existing.setUpdatedAt(LocalDateTime.now());

        return repository.save(existing);
    }

    public void delete(Long id) {
        InstrumentEntity existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Instrument not found"));

        existing.setIsDeleted(true);
        existing.setUpdatedAt(LocalDateTime.now());
        repository.save(existing);
    }

}
