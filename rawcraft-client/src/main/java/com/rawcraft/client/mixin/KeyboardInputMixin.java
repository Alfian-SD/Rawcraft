package com.rawcraft.client.mixin;

import com.rawcraft.client.module.ModuleManager;
import com.rawcraft.client.module.impl.ToggleSprintModule;
import net.minecraft.client.player.ClientInput;
import net.minecraft.client.player.KeyboardInput;
import net.minecraft.world.entity.player.Input;
import net.minecraft.world.phys.Vec2;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(value = KeyboardInput.class, remap = false)
public abstract class KeyboardInputMixin extends ClientInput {

    @Inject(method = "tick", at = @At("RETURN"))
    private void onTick(CallbackInfo ci) {
        ToggleSprintModule mod = ModuleManager.getInstance().getModule(ToggleSprintModule.class);
        if (mod == null || !mod.isEnabled()) return;

        boolean sprint = this.keyPresses.sprint();
        boolean forward = this.keyPresses.forward();

        if (mod.isSprintToggled()) {
            sprint = true;
        }

        if (mod.isAutoRunActive()) {
            forward = true;
        }

        if (sprint != this.keyPresses.sprint() || forward != this.keyPresses.forward()) {
            this.keyPresses = new Input(
                forward,
                this.keyPresses.backward(),
                this.keyPresses.left(),
                this.keyPresses.right(),
                this.keyPresses.jump(),
                this.keyPresses.shift(),
                sprint
            );
            float impulseY = (forward == this.keyPresses.backward()) ? 0.0f : (forward ? 1.0f : -1.0f);
            float impulseX = (this.keyPresses.left() == this.keyPresses.right()) ? 0.0f : (this.keyPresses.left() ? 1.0f : -1.0f);
            this.moveVector = new Vec2(impulseX, impulseY).normalized();
        }
    }
}
