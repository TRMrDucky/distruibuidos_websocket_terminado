package com.demo.websocketserver.controller;

import com.demo.websocketserver.model.Mensaje;
import com.demo.websocketserver.model.MensajePrivado;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class MensajeController {

    private final SimpMessagingTemplate messagingTemplate;

    public MensajeController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/envio")
    @SendTo("/tema/mensajes")
    public Mensaje envio(Mensaje mensaje) {
        return new Mensaje(mensaje.nombre(), mensaje.contenido());
    }

    @MessageMapping("/privado")
    @SendTo("/tema/privado")
    public MensajePrivado mensajePrivado(MensajePrivado mensaje) {
        return mensaje;
    }
}
