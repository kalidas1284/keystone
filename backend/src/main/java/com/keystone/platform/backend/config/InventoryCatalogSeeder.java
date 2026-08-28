package com.keystone.platform.backend.config;

import com.keystone.platform.backend.entity.InventoryItem;
import com.keystone.platform.backend.repository.InventoryItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Ensures a usable parts catalog exists even when the main demo seeder
 * skipped because users were already present. Adds any missing catalog codes.
 */
@Component
@Profile("local")
@Order(20)
@RequiredArgsConstructor
@Slf4j
public class InventoryCatalogSeeder implements ApplicationRunner {

    private final InventoryItemRepository inventoryItemRepository;

    @Override
    public void run(ApplicationArguments args) {
        List<InventoryItem> catalog = List.of(
                item("FILT-16", "Air Filter 16x20", "Standard MERV-8 filter", "Filters", 24, 8, "9.50", "PartsCo"),
                item("FILT-20", "Air Filter 20x20", "Standard commercial filter", "Filters", 18, 5, "12.50", "PartsCo"),
                item("FILT-25", "Air Filter 25x25", "Large rooftop filter", "Filters", 10, 4, "18.00", "PartsCo"),
                item("BELT-A", "Drive Belt A", "A-section drive belt", "Belts", 12, 4, "18.00", "PartsCo"),
                item("BELT-B", "Drive Belt B", "B-section drive belt", "Belts", 8, 3, "22.00", "PartsCo"),
                item("THERM-01", "Digital Thermostat", "Wall-mount programmable thermostat", "Controls", 6, 2, "85.00", "ControlTech"),
                item("CAP-35", "Capacitor 35uF", "Run capacitor for HVAC motors", "Electrical", 15, 5, "14.75", "ElectroSupply"),
                item("CAP-45", "Capacitor 45uF", "Run capacitor for larger units", "Electrical", 10, 4, "16.50", "ElectroSupply"),
                item("CONT-30", "Contactor 30A", "3-pole contactor", "Electrical", 7, 3, "28.00", "ElectroSupply"),
                item("WIRE-14", "14 AWG Wire (50ft)", "THHN copper wire spool", "Electrical", 20, 5, "32.00", "ElectroSupply"),
                item("PIPE-050", "1/2\" Copper Pipe (10ft)", "Type L copper tubing", "Plumbing", 14, 4, "24.00", "PipeWorks"),
                item("PIPE-075", "3/4\" Copper Pipe (10ft)", "Type L copper tubing", "Plumbing", 10, 3, "36.00", "PipeWorks"),
                item("FITT-90", "1/2\" Elbow Fitting", "Copper 90-degree elbow", "Plumbing", 40, 10, "2.25", "PipeWorks"),
                item("VALVE-B", "Ball Valve 1/2\"", "Full-port shutoff valve", "Plumbing", 16, 5, "11.00", "PipeWorks"),
                item("SEAL-RTV", "RTV Silicone Sealant", "High-temp HVAC sealant", "Consumables", 25, 8, "8.50", "PartsCo"),
                item("TAPE-ELE", "Electrical Tape", "Premium vinyl tape roll", "Consumables", 50, 12, "3.25", "PartsCo"),
                item("LAMP-LED", "LED Panel 2x2", "Commercial ceiling LED panel", "Lighting", 12, 4, "48.00", "BrightLite"),
                item("BALLAST", "LED Driver 40W", "Constant-current LED driver", "Lighting", 9, 3, "27.50", "BrightLite"),
                item("GASKET-U", "Unit Door Gasket", "Universal weather gasket kit", "HVAC Parts", 11, 4, "19.00", "PartsCo"),
                item("FAN-MOT", "Condenser Fan Motor", "1/4 HP outdoor fan motor", "HVAC Parts", 4, 2, "145.00", "PartsCo")
        );

        List<InventoryItem> toCreate = new ArrayList<>();
        for (InventoryItem candidate : catalog) {
            if (!inventoryItemRepository.existsByItemCodeIgnoreCase(candidate.getItemCode())) {
                toCreate.add(candidate);
            }
        }

        if (toCreate.isEmpty()) {
            return;
        }

        inventoryItemRepository.saveAll(toCreate);
        log.info("Seeded {} inventory catalog item(s)", toCreate.size());
    }

    private static InventoryItem item(
            String code,
            String name,
            String description,
            String category,
            int quantity,
            int minimumStock,
            String unitPrice,
            String supplier
    ) {
        return InventoryItem.builder()
                .itemCode(code)
                .name(name)
                .description(description)
                .category(category)
                .quantity(quantity)
                .minimumStock(minimumStock)
                .unitPrice(new BigDecimal(unitPrice))
                .supplier(supplier)
                .active(true)
                .build();
    }
}
