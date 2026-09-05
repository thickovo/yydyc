package com.gao.yydyc.dto;

import lombok.Data;
import java.util.List;

@Data
public class ToolDefinition {
    private String type = "function";
    private FunctionDefinition function;

    @Data
    public static class FunctionDefinition {
        private String name;
        private String description;
        private Parameters parameters;
    }

    @Data
    public static class Parameters {
        private String type = "object";
        private Properties properties;
        private List<String> required;
    }

    @Data
    public static class Properties {
        private Property userId;
        private Property month;
    }

    @Data
    public static class Property {
        private String type = "string";
        private String description;
    }
}