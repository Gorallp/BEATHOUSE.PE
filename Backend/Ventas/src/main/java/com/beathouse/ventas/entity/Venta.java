package com.beathouse.ventas.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "ventas")
@Data
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "instrumento_id", nullable = false)
    private Long instrumentoId;

    @Column(name = "fecha_venta", nullable = false)
    private LocalDateTime fechaVenta;

    @Column(name = "total", nullable = false)
    private Double total;

    @Column(name = "estado")
    private String estado; // e.g., PENDING, COMPLETED, CANCELLED

    @PrePersist
    protected void onCreate() {
        fechaVenta = LocalDateTime.now();
        if (estado == null) {
            estado = "COMPLETED";
        }
    }
}
