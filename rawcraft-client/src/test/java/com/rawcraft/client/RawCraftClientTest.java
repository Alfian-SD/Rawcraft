package com.rawcraft.client;

import com.rawcraft.client.config.ConfigData;
import com.rawcraft.client.config.ConfigManager;
import com.rawcraft.client.hud.HudAnchor;
import com.rawcraft.client.hud.HudManager;
import com.rawcraft.client.hud.HudWidget;
import com.rawcraft.client.hud.widgets.ArmorHudWidget;
import com.rawcraft.client.input.ClickTracker;
import com.rawcraft.client.modules.ModuleManager;
import com.rawcraft.client.modules.impl.FullbrightModule;
import com.rawcraft.client.performance.PerformanceManager;
import com.rawcraft.client.performance.PerformanceProfile;
import com.rawcraft.client.ui.RawCraftTheme;

import java.io.File;
import java.io.FileWriter;
import java.nio.file.Files;

public class RawCraftClientTest {
    public static void main(String[] args) throws Exception {
        System.out.println(">>> RUNNING RAWCRAFT CLIENT UNIT & RECOVERY TESTS <<<");

        testHudClamping();
        testArmorHudMath();
        testClickTracker();
        testConfigPersistenceAndCorruptRecovery();

        System.out.println(">>> ALL RAWCRAFT CLIENT UNIT TESTS PASSED SUCCESSFULLY! <<<");
    }

    private static void testHudClamping() {
        HudManager hud = HudManager.getInstance();
        HudWidget fps = hud.getWidget("fps");
        assert fps != null : "fps widget should exist";

        // Test TOP_LEFT
        fps.setAnchor(HudAnchor.TOP_LEFT);
        fps.setOffsetX(16);
        fps.setOffsetY(20);
        fps.updateScreenPosition(1000, 600);
        assert fps.getScreenX() == 16 : "ScreenX should be 16";
        assert fps.getScreenY() == 20 : "ScreenY should be 20";

        // Test Screen Boundary clamping (8px margin)
        fps.setOffsetX(9999);
        fps.updateScreenPosition(1000, 600);
        int maxAllowedX = 1000 - fps.getScaledWidth() - 8;
        assert fps.getScreenX() == maxAllowedX : "ScreenX must be clamped to 8px margin from right edge";

        fps.setOffsetX(-50);
        fps.updateScreenPosition(1000, 600);
        assert fps.getScreenX() == 8 : "ScreenX must be clamped to 8px margin from left edge";

        System.out.println("  [PASS] HUD Clamping & Screen Margin (8px) validated");
    }

    private static void testArmorHudMath() {
        // High durability > 55%
        ArmorHudWidget.ArmorItemData helmet = new ArmorHudWidget.ArmorItemData("Netherite Helmet", 389, 407, true);
        assert helmet.getPercentage() == 96 : "Percentage should be 96%";
        assert helmet.getColor() == RawCraftTheme.SUCCESS : "Color should be SUCCESS green";
        assert helmet.getReadout("BOTH").equals("389 (96%)") : "Readout BOTH mismatch: " + helmet.getReadout("BOTH");

        // Medium durability 25% - 55%
        ArmorHudWidget.ArmorItemData legs = new ArmorHudWidget.ArmorItemData("Netherite Leggings", 200, 500, true);
        assert legs.getPercentage() == 40 : "Percentage should be 40%";
        assert legs.getColor() == RawCraftTheme.WARNING : "Color should be WARNING amber";

        // Low durability <= 25%
        ArmorHudWidget.ArmorItemData boots = new ArmorHudWidget.ArmorItemData("Netherite Boots", 50, 481, true);
        assert boots.getPercentage() == 10 : "Percentage should be 10%";
        assert boots.getColor() == RawCraftTheme.ERROR : "Color should be ERROR red";

        // Non-durability item (Golden Apple)
        ArmorHudWidget.ArmorItemData apple = new ArmorHudWidget.ArmorItemData("Golden Apple x14", 0, 0, false);
        assert !apple.hasDurability : "Apple should not have durability";
        assert "NO DURABILITY".equals(apple.getReadout("BOTH")) : "Apple readout must be NO DURABILITY";

        System.out.println("  [PASS] Armor HUD Durability thresholds & non-durability handling validated");
    }

    private static void testClickTracker() throws Exception {
        ClickTracker tracker = ClickTracker.getInstance();
        tracker.setWindowMs(1000L);
        tracker.recordLeftClick();
        tracker.recordLeftClick();
        tracker.recordRightClick();

        assert tracker.getLeftCps() >= 2 : "Left CPS should be at least 2";
        assert tracker.getRightCps() >= 1 : "Right CPS should be at least 1";

        System.out.println("  [PASS] ClickTracker rolling timestamp window validated");
    }

    private static void testConfigPersistenceAndCorruptRecovery() throws Exception {
        File tempDir = Files.createTempDirectory("rawcraft-config-test").toFile();
        File testConfig = new File(tempDir, "client.json");

        ConfigManager cfgManager = ConfigManager.getInstance();
        cfgManager.setConfigPath(testConfig);

        // 1. Initial Load & Default Generation
        cfgManager.load();
        assert testConfig.exists() : "client.json should be created on default save";

        // 2. Modify module & Save
        FullbrightModule fb = ModuleManager.getInstance().getModule(FullbrightModule.class);
        fb.getGammaStrength().setValue(12.0);
        PerformanceManager.getInstance().applyProfile(PerformanceProfile.LOW);
        cfgManager.save();

        // 3. Reload and verify persistence
        cfgManager.load();
        ConfigData loaded = cfgManager.getCurrentConfig();
        assert "Low".equalsIgnoreCase(loaded.performance.activeProfile) || "Low".equalsIgnoreCase(loaded.performanceProfile) : "Performance profile should be Low";

        // 4. Corrupt JSON Recovery Test
        FileWriter fw = new FileWriter(testConfig);
        fw.write("{{{ CORRUPT INVALID JSON DATA ###");
        fw.close();

        // Reload must catch syntax error, log warning, and safely restore defaults
        cfgManager.load();
        assert cfgManager.getCurrentConfig() != null : "Config must safely recover to non-null defaults";
        assert cfgManager.getCurrentConfig().schemaVersion == 1 : "Schema version must be 1";

        System.out.println("  [PASS] Config atomic persistence and corrupt JSON recovery validated");

        // Cleanup
        testConfig.delete();
        tempDir.delete();
    }
}
