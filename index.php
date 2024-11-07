<?php
/*
  Plugin Name: Ashutosh Rode.
  Description: Task 2 plugin for Cyber Crescent by Ashutosh Rode
  Version: 1.0
  Author: Ashutosh Rode
*/

if (!defined('ABSPATH')) exit;

class AshuTaskPlugin
{
    private $cache_key = 'ashutosh_task_api_data';

    function __construct()
    {
        add_action('init', array($this, 'registerAssets'));

        add_action('rest_api_init', array($this, 'registerAPI'));
        add_action('admin_menu', array($this, 'addAdminPage'));


        add_action('wp_enqueue_scripts', array($this, 'frontendAssets'));
        add_action('enqueue_block_editor_assets', array($this, 'editorAssets'));

        if (defined('WP_CLI') && WP_CLI) {
            WP_CLI::add_command('ashu_task', array($this, 'fetchDataFromRemoteAPI'));
        }
    }

    function registerAssets()
    {
        wp_register_script('customBlockScript', plugin_dir_url(__FILE__) . 'build/index.js', array('wp-blocks', 'wp-element', 'wp-editor'), '1.0', true);
        wp_register_style('customBlockStyles', plugin_dir_url(__FILE__) . 'build/index.css');

        register_block_type('ashutosh-task/data-block', array(


            'editor_script' => 'customBlockScript',
            'editor_style' => 'customBlockStyles',
            'render_callback' => array($this, 'renderBlock'),
            'attributes' => array(
                'tableBodyColor' => array('type' => 'string', 'default' => '#ade48e'),
                'textColor' => array('type' => 'string', 'default' => '#000'),
                'visibleColumns' => array('type' => 'array', 'default' => array('id', 'fname', 'lname', 'email', 'date'))
            ),
        ));
    }

    function registerAPI()
    {
        register_rest_route('ashutosh-task/v1', '/fetch-data', array(
            'methods' => 'GET',
            'callback' => array($this, 'getCachedData')
        ));

        add_action('wp_ajax_nopriv_get_api_data', array($this, 'getCachedData'));
        add_action('wp_ajax_get_api_data', array($this, 'getCachedData'));
    }

    function fetchDataFromRemoteAPI()
    {
        $cached_data = get_transient($this->cache_key);
        if ($cached_data) {
            return $cached_data;
        }

        $response = wp_remote_get('https://miusage.com/v1/challenge/1/');
        if (is_wp_error($response)) {
            return new WP_Error('api_error', 'Failed to fetch data', array('status' => 500));
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);
        set_transient($this->cache_key, $data, HOUR_IN_SECONDS);

        return $data;
    }

    function getCachedData()
    {
        $data = $this->fetchDataFromRemoteAPI();


        return rest_ensure_response($data);
    }

    function addAdminPage()
    {
        add_menu_page(
            'API Data',
            'API Data',
            'manage_options',
            'api-data',
            array($this, 'renderAdminPage'),
            'dashicons-list-view'
        );
    }

    function renderAdminPage()
    {
     
        $data = $this->fetchDataFromRemoteAPI();
        $rows = isset($data['data']['rows']) ? $data['data']['rows'] : [];

        echo '<div class="wrap">';
        echo '<h1>API Data</h1>';

        echo '<button id="refresh-data-button" class="button button-primary" onclick="location.reload()">Refresh Data</button>';
        echo '<table class="widefat fixed striped">';

       
        echo '<thead><tr>';
        echo '<th>ID</th>';
        echo '<th>First Name</th>';
        echo '<th>Last Name</th>';
        echo '<th>Email</th>';
        echo '<th>Date</th>';
        echo '</tr></thead>';

       
        echo '<tbody>';
        foreach ($rows as $row) {
            echo '<tr>';
            echo '<td>' . esc_html($row['id']) . '</td>';
            echo '<td>' . esc_html($row['fname']) . '</td>';
            echo '<td>' . esc_html($row['lname']) . '</td>';
            echo '<td>' . esc_html($row['email']) . '</td>';
            echo '<td>' . esc_html($row['date']) . '</td>';
            echo '</tr>';
        }
        echo '</tbody>';

        echo '</table>';
        echo '</div>';
    }



    function frontendAssets()
    {
        wp_enqueue_script('customFrontendScript', plugin_dir_url(__FILE__) . 'build/frontend.js', 
        array('wp-element'), '1.0', true);
        
        wp_enqueue_style('customFrontendStyles', plugin_dir_url(__FILE__) . 'build/frontend.css');
    }

    function editorAssets()
    {
        wp_enqueue_script('customEditorScript', plugin_dir_url(__FILE__) . 'build/index.js', 
        array('wp-element', 'wp-blocks', 'wp-components'), '1.0', true);
    }

    function renderBlock($attributes)
    {
        $data = $this->fetchDataFromRemoteAPI();
        $style = sprintf(
            'color: %s; background-color: %s;',
            esc_attr($attributes['textColor']),


            esc_attr($attributes['tableBodyColor'])
        );

        ob_start();
?>
        <table class="ashutosh-task-table" style="<?php echo $style; ?>">
            <thead>
                <tr>
                    <?php foreach ($attributes['visibleColumns'] as $column): ?>
                        <th>
                            
                        
                        <?php echo ucfirst($column); ?>
                    
                    
                    </th>
                    <?php endforeach; ?>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($data['data']['rows'] as $row): ?>
                    <tr>
                        <?php foreach ($attributes['visibleColumns'] as $column): ?>

                            <td>
                                <?php echo esc_html($row[$column]); ?>
                            
                            
                            
                            </td>
                        <?php endforeach; ?>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
<?php
        return ob_get_clean();
    }
}

$ashuTaskPlugin = new AshuTaskPlugin();
