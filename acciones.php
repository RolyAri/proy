<?php
    require('connect.php');

    if (isset($_GET['action'])){
        if($_GET['action'] == 'getProductos') {
            echo json_encode(getProductos($pdo));
        }else if($_GET['action'] == 'getCentroCostos'){
            echo json_encode(getCentroCostos($pdo));
        }else if($_GET['action'] == 'getUsuarios'){
            echo json_encode(getUsuarios($pdo));
        }else if($_GET['action'] == 'saveDetalle'){
            echo json_encode(saveDetalle($pdo, $_POST));
        }else if($_GET['action'] == 'getReporte'){
            echo json_encode(getReporte($pdo, $_POST));
        }
    }

    function getProductos($pdo) {
        try {
            $sql = "SELECT id_cprod, ccodprod, cdesprod, ntipo, ngrupo, nclase, nfam, nund, nfactor, cmarca, cmodelo, cnparte, mobservac, rfoto, flgSerie, flgDetrac, flgActivo, flgActFij, freg, iduser, cCodPat 
            FROM cm_producto WHERE ntipo=37";

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
            FROM tb_proyectos WHERE nflgactivo = 1";

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
            FROM tb_user WHERE nflgactivo = 1";

            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            $row = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $row;

        } catch(PDOException $e){
            echo $th->getMessage();
            return false;
        }
    }

    function getReporte($pdo, $data){
        try{

            $input = file_get_contents("php://input");
            // Decodificar el JSON recibido
            $reporte = json_decode($input, true);

            $sql = "SELECT id, nidprod, ccodprod, cdesprod, ncantprod, cnumdoc, dfecha, nidproy, p.ccodproy, p.cdesproy FROM tb_detalle INNER JOIN tb_proyectos p on p.nidreg = nidproy WHERE dfecha = :fecha";

            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':fecha' => $reporte['fecha']
            ]);
            $row = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $row;

        } catch(PDOException $e){
            echo $th->getMessage();
            return false;
        }
    }

    function saveDetalle($pdo, $datos) {
        try {
            $input = file_get_contents("php://input");
            // Decodificar el JSON recibido
            $detalle = json_decode($input, true);
            if(count($detalle) > 0) {
                $sql = "INSERT INTO tb_detalle SET ccodprod = :codprod, nidprod = :idprod, cdesprod = :desprod, ncantprod = :cantprod, cnumdoc = :numdoc, dfecha = :fecha, nidproy = :centrocosto";
                $stmt = $pdo->prepare($sql);
                foreach ($detalle as $d){
                    $stmt->execute([
                        ':codprod' => $d['codprod'],
                        ':idprod' => $d['idprod'],
                        ':desprod' => $d['desprod'],
                        ':cantprod' => $d['cantprod'],
                        ':numdoc' => $d['numdoc'],
                        ':fecha' => $d['fecha'],
                        ':centrocosto' => $d['centrocosto']
                    ]);
                }
                return ['success' => true, 'msg' => 'guardado exitoso'];
            }else{
                return ['success' => false, 'msg' => 'tamaño menor a 0'];
            }
            
        } catch(PDOException $e){
            /* echo $th->getMessage(); */
            return ['success' => false, 'msg' => $e->getMessage()];
        }
    }
?>