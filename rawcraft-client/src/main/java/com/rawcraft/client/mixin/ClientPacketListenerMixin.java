package com.rawcraft.client.mixin;

import com.rawcraft.client.command.ClientCommandHandler;
import net.minecraft.client.multiplayer.ClientPacketListener;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(value = ClientPacketListener.class, remap = false)
public class ClientPacketListenerMixin {

    @Inject(method = "sendCommand(Ljava/lang/String;)V", at = @At("HEAD"), cancellable = true)
    private void onSendCommand(String command, CallbackInfo ci) {
        if (ClientCommandHandler.handleCommand(command)) {
            ci.cancel();
        }
    }
}
