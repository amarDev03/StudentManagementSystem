package com.amar.sms.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
    	
        super(message);
    }
}