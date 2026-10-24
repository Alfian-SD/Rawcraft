package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.impl.AnimationsMod;
import com.rawcraft.client.mod.impl.ArmorBarMod;
import com.rawcraft.client.mod.impl.ArmorStatusMod;
import com.rawcraft.client.mod.impl.AttackIndicatorMod;
import com.rawcraft.client.mod.impl.AutohideHudMod;
import com.rawcraft.client.mod.impl.AutoPerspectiveMod;
import com.rawcraft.client.mod.impl.AutoTextMod;
import com.rawcraft.client.mod.impl.BackupsMod;
import com.rawcraft.client.mod.impl.BlockIndicatorMod;
import com.rawcraft.client.mod.impl.BlockOverlayMod;
import com.rawcraft.client.mod.impl.BossBarMod;
import com.rawcraft.client.mod.impl.BrightnessMod;
import com.rawcraft.client.mod.impl.CameraMod;
import com.rawcraft.client.mod.impl.ColorSaturationMod;
import com.rawcraft.client.mod.impl.ComboDisplayMod;
import com.rawcraft.client.mod.impl.CoordinatesMod;
import com.rawcraft.client.mod.impl.CpsMod;
import com.rawcraft.client.mod.impl.CustomCrosshairMod;
import com.rawcraft.client.mod.impl.CullLogsMod;
import com.rawcraft.client.mod.impl.CustomAdvancementsMod;
import com.rawcraft.client.mod.impl.CustomChatMod;
import com.rawcraft.client.mod.impl.CustomF3Mod;
import com.rawcraft.client.mod.impl.CustomFogMod;
import com.rawcraft.client.mod.impl.DamageIndicatorMod;
import com.rawcraft.client.mod.impl.DarkModeMod;
import com.rawcraft.client.mod.impl.DeathInfoMod;
import com.rawcraft.client.mod.impl.DirectionMod;
import com.rawcraft.client.mod.impl.DiscordMod;
import com.rawcraft.client.mod.impl.DropPreventionMod;
import com.rawcraft.client.mod.impl.ElytrasMod;
import com.rawcraft.client.mod.impl.FovChangerMod;
import com.rawcraft.client.mod.impl.FpsMod;
import com.rawcraft.client.mod.impl.GlintMod;
import com.rawcraft.client.mod.impl.HeartsMod;
import com.rawcraft.client.mod.impl.HitboxMod;
import com.rawcraft.client.mod.impl.HitIndicatorMod;
import com.rawcraft.client.mod.impl.HorsesMod;
import com.rawcraft.client.mod.impl.HypixelMod;
import com.rawcraft.client.mod.impl.InventoryMod;
import com.rawcraft.client.mod.impl.ItemCounterMod;
import com.rawcraft.client.mod.impl.ItemDespawnMod;
import com.rawcraft.client.mod.impl.ItemInfoMod;
import com.rawcraft.client.mod.impl.ItemPhysicMod;
import com.rawcraft.client.mod.impl.JumpResetMod;
import com.rawcraft.client.mod.impl.KeystrokesMod;
import com.rawcraft.client.mod.impl.LightLevelOverlayMod;
import com.rawcraft.client.mod.impl.LootBeamsMod;
import com.rawcraft.client.mod.impl.MobOverlayMod;
import com.rawcraft.client.mod.impl.PingMod;
import com.rawcraft.client.mod.impl.ReachDisplayMod;
import com.rawcraft.client.mod.impl.ReconnectMod;
import com.rawcraft.client.mod.impl.SaturationMod;
import com.rawcraft.client.mod.impl.ScoreboardMod;
import com.rawcraft.client.mod.impl.ScreenshotMod;
import com.rawcraft.client.mod.impl.KeybindSearchMod;
import com.rawcraft.client.mod.impl.ServerAddressMod;
import com.rawcraft.client.mod.impl.ShieldStatusMod;
import com.rawcraft.client.mod.impl.ShulkerTooltipsMod;
import com.rawcraft.client.mod.impl.SnaplookMod;
import com.rawcraft.client.mod.impl.SoundFiltersMod;
import com.rawcraft.client.mod.impl.SpeedMeterMod;
import com.rawcraft.client.mod.impl.StopwatchMod;
import com.rawcraft.client.mod.impl.SubtitlesMod;
import com.rawcraft.client.mod.impl.SystemResourcesMod;
import com.rawcraft.client.mod.impl.TablistMod;
import com.rawcraft.client.mod.impl.TeamTrackerMod;
import com.rawcraft.client.mod.impl.TierTaggerMod;
import com.rawcraft.client.mod.impl.TimeMod;
import com.rawcraft.client.mod.impl.TimeChangerMod;
import com.rawcraft.client.mod.impl.TitleTweakerMod;
import com.rawcraft.client.mod.impl.TntTimerMod;
import com.rawcraft.client.mod.impl.ToastControlMod;
import com.rawcraft.client.mod.impl.ToggleSprintMod;
import com.rawcraft.client.mod.impl.TooltipsMod;
import com.rawcraft.client.mod.impl.TotemMod;
import com.rawcraft.client.mod.impl.TpsMod;
import com.rawcraft.client.mod.impl.UhcOverlayMod;
import com.rawcraft.client.mod.impl.UiScalingMod;
import com.rawcraft.client.mod.impl.ViewModelMod;
import com.rawcraft.client.mod.impl.VisualsMod;
import com.rawcraft.client.mod.impl.VoiceMod;
import com.rawcraft.client.mod.impl.WaypointsMod;
import com.rawcraft.client.mod.impl.WeatherChangerMod;
import com.rawcraft.client.mod.impl.ZoomMod;

import com.rawcraft.client.mod.ClientMod;

import java.util.List;

/**
 * Every mod the client ships, in registry order. The menu sorts by display name at runtime, so this
 * order only matters for reproducible logs.
 *
 * <p>TODO registry slots: the reference screenshots had rows between Hit Indicator/Horses,
 * Mob Overlay/Reach Display, Speed Meter/Stopwatch and Toggle Sprint/Tooltips that were never
 * supplied. Those four mods are unknown; add them here rather than guessing names.
 */
public final class ModRegistry {
    private ModRegistry() {
    }

    public static List<ClientMod> createAll() {
        return List.of(
            new AnimationsMod(),
            new ArmorBarMod(),
            new ArmorStatusMod(),
            new AttackIndicatorMod(),
            new AutohideHudMod(),
            new AutoPerspectiveMod(),
            new AutoTextMod(),
            new BackupsMod(),
            new BlockIndicatorMod(),
            new BlockOverlayMod(),
            new BossBarMod(),
            new BrightnessMod(),
            new CameraMod(),
            new ColorSaturationMod(),
            new ComboDisplayMod(),
            new CoordinatesMod(),
            new CpsMod(),
            new CustomCrosshairMod(),
            new CullLogsMod(),
            new CustomAdvancementsMod(),
            new CustomChatMod(),
            new CustomF3Mod(),
            new CustomFogMod(),
            new DamageIndicatorMod(),
            new DarkModeMod(),
            new DeathInfoMod(),
            new DirectionMod(),
            new DiscordMod(),
            new DropPreventionMod(),
            new ElytrasMod(),
            new FovChangerMod(),
            new FpsMod(),
            new GlintMod(),
            new HeartsMod(),
            new HitboxMod(),
            new HitIndicatorMod(),
            new HorsesMod(),
            new HypixelMod(),
            new InventoryMod(),
            new ItemCounterMod(),
            new ItemDespawnMod(),
            new ItemInfoMod(),
            new ItemPhysicMod(),
            new JumpResetMod(),
            new KeystrokesMod(),
            new LightLevelOverlayMod(),
            new LootBeamsMod(),
            new MobOverlayMod(),
            new PingMod(),
            new ReachDisplayMod(),
            new ReconnectMod(),
            new SaturationMod(),
            new ScoreboardMod(),
            new ScreenshotMod(),
            new KeybindSearchMod(),
            new ServerAddressMod(),
            new ShieldStatusMod(),
            new ShulkerTooltipsMod(),
            new SnaplookMod(),
            new SoundFiltersMod(),
            new SpeedMeterMod(),
            new StopwatchMod(),
            new SubtitlesMod(),
            new SystemResourcesMod(),
            new TablistMod(),
            new TeamTrackerMod(),
            new TierTaggerMod(),
            new TimeMod(),
            new TimeChangerMod(),
            new TitleTweakerMod(),
            new TntTimerMod(),
            new ToastControlMod(),
            new ToggleSprintMod(),
            new TooltipsMod(),
            new TotemMod(),
            new TpsMod(),
            new UhcOverlayMod(),
            new UiScalingMod(),
            new ViewModelMod(),
            new VisualsMod(),
            new VoiceMod(),
            new WaypointsMod(),
            new WeatherChangerMod(),
            new ZoomMod()
        );
    }
}
