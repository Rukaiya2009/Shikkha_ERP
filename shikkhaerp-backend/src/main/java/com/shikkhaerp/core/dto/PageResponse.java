//cat > src/main/java/com/shikkhaerp/core/dto/PageResponse.java << 'EOF'
package com.shikkhaerp.core.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {
    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean last;
    private boolean first;
    
    public static <T> PageResponse<T> empty() {
        return PageResponse.<T>builder()
            .content(List.of())
            .totalElements(0)
            .totalPages(0)
            .last(true)
            .first(true)
            .build();
    }
}
