package com.beathouse.com.beathouse.controller;

import com.beathouse.com.beathouse.entity.InstrumentEntity;
import com.beathouse.com.beathouse.service.InstrumentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/instruments")
public class InstrumentController {

    private final InstrumentService service;

    public InstrumentController(InstrumentService service) {
        this.service = service;
    }

    @GetMapping
    public org.springframework.data.domain.Page<InstrumentEntity> list(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return service.findAll(pageable);
    }

    @GetMapping("/{id}")
    public InstrumentEntity get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public ResponseEntity<InstrumentEntity> create(@RequestBody InstrumentEntity instrument, UriComponentsBuilder uriBuilder) {
        InstrumentEntity created = service.create(instrument);
        URI uri = uriBuilder.path("/api/instruments/{id}").buildAndExpand(created.getId()).toUri();
        return ResponseEntity.created(uri).body(created);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, path = "/multipart")
    public ResponseEntity<InstrumentEntity> createMultipart(
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("price") BigDecimal price,
            @RequestParam(value = "category", required = false) String category,
            @RequestPart(value = "image", required = false) MultipartFile image,
            UriComponentsBuilder uriBuilder) {

        InstrumentEntity created = service.createFromForm(name, description, price, category, image);
        URI uri = uriBuilder.path("/api/instruments/{id}").buildAndExpand(created.getId()).toUri();
        return ResponseEntity.created(uri).body(created);
    }

    @PutMapping("/{id}")
    public InstrumentEntity update(@PathVariable Long id, @RequestBody InstrumentEntity instrument) {
        return service.update(id, instrument);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

}
