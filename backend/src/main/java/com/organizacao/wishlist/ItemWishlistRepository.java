package com.organizacao.wishlist;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ItemWishlistRepository extends JpaRepository<ItemWishlist, UUID> {
    List<ItemWishlist> findByUsuarioId(UUID usuarioId);
    Optional<ItemWishlist> findByIdAndUsuarioId(UUID id, UUID usuarioId);
}
