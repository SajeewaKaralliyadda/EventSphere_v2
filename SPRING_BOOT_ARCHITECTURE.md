# EventSphere: Spring Boot Modular Monolith Architecture

This document outlines the Context-Based Architecture (Domain-Driven Design) for the EventSphere backend using Spring Boot 3+.

## Task 1: Backend Structure (Modular Monolith)

A modular monolith structure ensures high cohesion and low coupling by organizing code by bounded contexts rather than technical layers (e.g., all controllers together).

```text
src/main/java/com/eventsphere/
âââ EventSphereApplication.java
âââ common/                     # Shared kernel (exceptions, base entities, utils)
â   âââ config/
â   âââ exception/
âââ tenant/                     # Tenant Bounded Context
â   âââ entity/
â   âââ repository/
â   âââ service/
â   âââ web/                      # Controllers & DTOs
âââ identity/                   # Identity & Access Bounded Context
â   âââ entity/
â   âââ security/                 # JWT Filters, UserDetails
â   âââ service/
â   âââ web/
âââ catalog/                    # Event Catalog Bounded Context
â   âââ entity/
â   âââ repository/
â   âââ service/
â   âââ web/
âââ commerce/                   # Commerce Bounded Context
    âââ entity/
    âââ payment/                  # Gateway Integrations
    âââ service/
    âââ web/
```

## Multi-Tenancy Approach: Discriminator Column (`tenant_id`)

For a SaaS platform with many universities, a **Shared Database, Shared Schema** approach using a `tenant_id` discriminator column is the most scalable and easiest to maintain. Spring Boot 3+ and Hibernate 6+ make this trivial with the `@TenantId` annotation.

### 1. Tenant Entity (Tenant Context)

```java
package com.eventsphere.tenant.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "tenants")
@Data
public class Tenant {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String domain; // e.g., "mit.eventsphere.com"

    @Column(name = "primary_color")
    private String primaryColor;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(nullable = false)
    private boolean isActive = true;
}
```

### 2. Tenant Repository

```java
package com.eventsphere.tenant.repository;

import com.eventsphere.tenant.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface TenantRepository extends JpaRepository<Tenant, UUID> {
    Optional<Tenant> findByDomain(String domain);
}
```

### 3. Tenant Service

```java
package com.eventsphere.tenant.service;

import com.eventsphere.tenant.entity.Tenant;
import com.eventsphere.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TenantService {
    private final TenantRepository tenantRepository;

    @Transactional(readOnly = true)
    public List<Tenant> getAllActiveTenants() {
        return tenantRepository.findAll().stream()
                .filter(Tenant::isActive)
                .toList();
    }

    @Transactional
    public Tenant onboardTenant(Tenant newTenant) {
        // Add business logic: domain validation, default settings creation, etc.
        return tenantRepository.save(newTenant);
    }
}
```

### 4. Applying Multi-Tenancy to Other Contexts (e.g., Event Catalog)

Using Hibernate's `@TenantId`, any entity belonging to a specific university will automatically filter queries by the current tenant context.

```java
package com.eventsphere.catalog.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.TenantId;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "events")
@Data
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // This tells Hibernate to automatically append "WHERE tenant_id = ?" to all queries
    // and automatically set the tenant_id on inserts.
    @TenantId
    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(nullable = false)
    private String title;

    private String description;
    
    // ... other event fields
}
```

### 5. Tenant Context Resolver (Identity Context)

You will need a `CurrentTenantIdentifierResolver` to tell Hibernate which tenant is currently active, usually extracted from the JWT token or the subdomain.

```java
package com.eventsphere.identity.security;

import org.hibernate.context.spi.CurrentTenantIdentifierResolver;
import org.springframework.stereotype.Component;
import org.springframework.security.core.context.SecurityContextHolder;

@Component
public class TenantIdentifierResolver implements CurrentTenantIdentifierResolver<String> {

    @Override
    public String resolveCurrentTenantIdentifier() {
        // Extract tenant ID from the authenticated user's JWT token
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails user) {
            return user.getTenantId().toString();
        }
        // Fallback for Super Admin or unauthenticated requests
        return "GLOBAL"; 
    }

    @Override
    public boolean validateExistingCurrentSessions() {
        return true;
    }
}
```
