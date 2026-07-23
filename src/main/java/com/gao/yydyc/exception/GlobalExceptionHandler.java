package com.gao.yydyc.exception;
import com.gao.yydyc.common.Result;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import javax.validation.ValidationException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(value = Exception.class)
    public Result<Void> handleException(Exception e)
    {
        return Result.error("系统繁忙，请稍后在试");

    }

    @ExceptionHandler(value = BusinessException.class)
    public Result<Void> handleBusinessException(BusinessException e){
        return Result.error(e.getMessage());
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public Result<Void> handleValidationException(MethodArgumentNotValidException e){
        BindingResult bindingResult = e.getBindingResult();
        FieldError fieldError = bindingResult.getFieldError();
        String field = fieldError.getField();
        String error = fieldError.getDefaultMessage();
        return Result.error(field + ":" + error);
    }
}
