package com.beathouse.ventas.service;

import com.beathouse.ventas.entity.Venta;
import java.util.List;
import java.util.Optional;

public interface VentaService {
    Venta createVenta(Venta venta);

    List<Venta> getAllVentas();

    Optional<Venta> getVentaById(Long id);

    List<Venta> getVentasByUsuarioId(Long usuarioId);

    void deleteVenta(Long id);
}
