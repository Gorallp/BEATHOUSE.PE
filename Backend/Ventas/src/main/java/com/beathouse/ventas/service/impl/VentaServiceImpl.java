package com.beathouse.ventas.service.impl;

import com.beathouse.ventas.entity.Venta;
import com.beathouse.ventas.repository.VentaRepository;
import com.beathouse.ventas.service.VentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VentaServiceImpl implements VentaService {

    @Autowired
    private VentaRepository ventaRepository;

    @Override
    public Venta createVenta(Venta venta) {
        return ventaRepository.save(venta);
    }

    @Override
    public List<Venta> getAllVentas() {
        return ventaRepository.findAll();
    }

    @Override
    public Optional<Venta> getVentaById(Long id) {
        return ventaRepository.findById(id);
    }

    @Override
    public List<Venta> getVentasByUsuarioId(Long usuarioId) {
        return ventaRepository.findByUsuarioId(usuarioId);
    }

    @Override
    public void deleteVenta(Long id) {
        ventaRepository.deleteById(id);
    }
}
