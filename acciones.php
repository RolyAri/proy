<?php
    require('connect.php');

    if (isset($_GET['action'])){
        if($_GET['action'] == 'getProductos') {
            echo json_encode(getProductos($pdo));
        }else if($_GET['action'] == 'getCentroCostos'){
            echo json_encode(getCentroCostos($pdo));
        }else if($_GET['action'] == 'getUsuarios'){
            echo json_encode(getUsuarios($pdo));
        }
    }

    function getProductos($pdo) {
        try {
            $sql = "SELECT id_cprod, ccodprod, cdesprod, ntipo, ngrupo, nclase, nfam, nund, nfactor, cmarca, cmodelo, cnparte, mobservac, rfoto, flgSerie, flgDetrac, flgActivo, flgActFij, freg, iduser, cCodPat 
            FROM new_bd.cm_producto";

            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            $row = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $row;
        } catch(PDOException $e){
            echo $th->getMessage();
            return false;
        }
    }

    function getCentroCostos($pdo){
        try{

            $sql = "SELECT nidreg, ccodproy, cdesproy, cubica, creponsable, cabrevia, ncosto, veralm, costo_proyectos, nflgactivo, fregsys, nalmacen 
            FROM new_bd.tb_proyectos WHERE nflgactivo = 1";

            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            $row = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $row;

        } catch(PDOException $e){
            echo $th->getMessage();
            return false;
        }
    }

    function getUsuarios($pdo){
        try{

            $sql = "SELECT iduser, cnameuser, cnombres, cclave, ncodper, nrol, ccorreo, fvigdesde, fvighasta, cinicial, nestado, cavatar, nflgactivo, freg, ccargo, rol, nflgvista, nflgvence 
            FROM new_bd.tb_user WHERE nflgactivo = 1";

            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            $row = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $row;

        } catch(PDOException $e){
            echo $th->getMessage();
            return false;
        }
    }
?>