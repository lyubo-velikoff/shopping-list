<?php

/**
 * Improvising data fetch 
 */

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$data = array();

$images = array('tech.jpg', 'tech1.jpg', 'tech2.jpg', 'tech3.jpg');


if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    // fill data
    for($i = 0; $i < 10; $i++) {

        $randomImage =  $images[array_rand($images)];;
        $post = array(
            'url' => '#',
            'post-image' => 'assets/images/' . $randomImage,
            'user-name' => 'User name',
            'copy' => 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        );
        $data[] = $post;
    }

}

echo json_encode($data);
exit();
