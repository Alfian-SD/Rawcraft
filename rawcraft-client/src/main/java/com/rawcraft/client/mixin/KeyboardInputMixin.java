package com.rawcraft.client.mixin;

import com.rawcraft.client.modules.ModuleManager;
import com.rawcraft.client.modules.impl.ToggleSprintModule;
import net.minecraft.client.player.KeyboardInput;
import net.minecraft.world.entity.player.Input;
import net.minecraft.world.phys.Vec2;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(value = KeyboardInput.class, remap = false)
public class KeyboardInputMixin {

    @Shadow
    protected Vec2 moveVector;

    @Inject(method = "tick", at = @At("RETURN"))
    private void onTick(CallbackInfo ci) {
        KeyboardInput self = (KeyboardInput) (Object) this;
        ToggleSprintModule mod = ModuleManager.getInstance().getModule(ToggleSprintModule.class);
        if (mod == null || !mod.isEnabled()) return;

        boolean sprint = self.keyPresses.sprint();
        boolean forward = self.keyPresses.forward();

        if (mod.isSprintToggled()) {
            sprint = true;
        }

        if (mod.isAutoRunActive()) {
            forward = true;
        }

        if (sprint != self.keyPresses.sprint() || forward != self.keyPresses.forward()) {
            self.keyPresses = new Input(
                forward,
                self.keyPresses.backward(),
                self.keyPresses.left(),
                self.keyPresses.right(),
                self.keyPresses.jump(),
                self.keyPresses.shift(),
                sprint
            );
            float impulseY = (forward == self.keyPresses.backward()) ? 0.0f : (forward ? 1.0f : -1.0f);
            float impulseX = (self.keyPresses.left() == self.keyPresses.right()) ? 0.0f : (self.keyPresses.left() ? 1.0f : -1.0f);
            this.moveVector = new Vec2(impulseX, impulseY).normalized();
        }
    }
}
