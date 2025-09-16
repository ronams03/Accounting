<?php
class Response {
    public static function success($data = [], $message = 'Success', $code = 200, $pagination = null) {
        http_response_code($code);
        $response = [
            'success' => true,
            'message' => $message,
            'data' => $data,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        if ($pagination) {
            $response['pagination'] = $pagination;
        }
        
        return $response;
    }
    
    public static function error($message = 'Error', $code = 400, $errors = []) {
        http_response_code($code);
        return [
            'success' => false,
            'message' => $message,
            'errors' => $errors,
            'timestamp' => date('Y-m-d H:i:s')
        ];
    }
    
    public static function paginated($data, $total, $page, $limit, $message = 'Success') {
        return self::success($data, $message, 200, [
            'total' => $total,
            'current_page' => $page,
            'per_page' => $limit,
            'total_pages' => ceil($total / $limit)
        ]);
    }
}
?>
