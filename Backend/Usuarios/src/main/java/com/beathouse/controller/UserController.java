package com.beathouse.controller;

import com.beathouse.model.User;
import com.beathouse.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // URL: http://localhost:8080/api/users/listar
    @GetMapping("/listar")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // URL: http://localhost:8080/api/users/buscar/1
    @GetMapping("/buscar/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // URL: http://localhost:8080/api/users/crear
    @PostMapping("/crear")
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    // URL: http://localhost:8080/api/users/actualizar/1
    @PutMapping("/actualizar/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Integer id, @RequestBody User userDetails) {
        try {
            User updatedUser = userService.updateUser(id, userDetails);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // URL: http://localhost:8080/api/users/eliminar/1
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}